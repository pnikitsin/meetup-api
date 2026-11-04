import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MeetupApi } from '../../../core/api/meetup-api';
import { parseApiError } from '../../../core/api/api-error';
import { I18n } from '../../../core/i18n/i18n';
import { Meetup, MeetupInput } from '../../../core/models/meetup';
import { toApiDateTime, toDateTimeLocalValue } from '../../../core/utils/date-time';
import { controlErrorMessage, trimmedRequired } from '../../../core/utils/form-errors';
import { ConfirmDialog } from '../../../shared/confirm/confirm';
import { MeetupDatePipe } from '../../../shared/pipes/meetup-date-pipe';
import { Toasts } from '../../../shared/toast/toast';

type MeetupField = 'name' | 'dateAndTime' | 'organizer' | 'address' | 'description';
type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-meetup-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MeetupDatePipe],
  templateUrl: './meetup-form.html',
  styleUrl: './meetup-form.scss',
})
export class MeetupForm {
  private readonly meetupApi = inject(MeetupApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly confirmDialog = inject(ConfirmDialog);
  private readonly toasts = inject(Toasts);

  readonly i18n = inject(I18n);
  readonly mode: FormMode = this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create';
  readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  readonly isEdit = computed(() => this.mode === 'edit');
  readonly title = computed(() =>
    this.isEdit() ? this.i18n.t('form.title.edit') : this.i18n.t('form.title.create'),
  );
  readonly subtitle = computed(() =>
    this.isEdit()
      ? this.i18n.t('form.subtitle.edit')
      : this.i18n.t('form.subtitle.create'),
  );
  readonly submitLabel = computed(() =>
    this.isEdit()
      ? this.i18n.t('form.submit.edit')
      : this.i18n.t('form.submit.create'),
  );
  readonly backLink: string[] =
    this.mode === 'edit' && this.id ? ['/meetups', this.id] : ['/meetups'];

  readonly loading = signal(this.mode === 'edit');
  readonly loadError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly serverFieldErrors = signal<Record<string, string>>({});
  readonly meetup = signal<Meetup | null>(null);

  readonly form = this.formBuilder.group({
    name: ['', [Validators.required, trimmedRequired, Validators.maxLength(64)]],
    dateAndTime: ['', [Validators.required]],
    organizer: ['', [Validators.required, trimmedRequired, Validators.maxLength(100)]],
    address: ['', [Validators.required, trimmedRequired, Validators.maxLength(64)]],
    description: ['', [Validators.required, trimmedRequired, Validators.maxLength(512)]],
  });

  private readonly dateValue = toSignal(this.form.controls.dateAndTime.valueChanges, {
    initialValue: this.form.controls.dateAndTime.value,
  });

  readonly previewDate = computed(() => this.dateValue());

  readonly dateInPast = computed(() => {
    const value = this.dateValue();

    if (!value) {
      return false;
    }

    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
  });

  constructor() {
    if (this.mode === 'edit') {
      void this.load();
    }
  }

  async load(): Promise<void> {
    if (!this.id) {
      this.loadError.set(this.i18n.t('form.missingId'));
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);

    try {
      const meetup = await firstValueFrom(this.meetupApi.getById(this.id));
      this.meetup.set(meetup);
      this.form.patchValue({
        name: meetup.name,
        dateAndTime: toDateTimeLocalValue(meetup.dateAndTime),
        organizer: meetup.organizer,
        address: meetup.address,
        description: meetup.description,
      });
      this.form.markAsPristine();
    } catch (error) {
      this.loadError.set(parseApiError(error, this.i18n.language()).message);
    } finally {
      this.loading.set(false);
    }
  }

  isInvalid(field: MeetupField): boolean {
    const control = this.form.controls[field];
    return (
      (control.invalid && (control.touched || this.submitted())) ||
      Boolean(this.serverErrorFor(field))
    );
  }

  errorFor(field: MeetupField): string {
    return (
      this.serverErrorFor(field) ??
      controlErrorMessage(this.form.controls[field], this.i18n.language())
    );
  }

  clearServerError(field: MeetupField): void {
    const key = field.toLowerCase();

    if (this.serverFieldErrors()[key]) {
      const next = { ...this.serverFieldErrors() };
      delete next[key];
      this.serverFieldErrors.set(next);
    }

    this.serverError.set(null);
  }

  counter(field: MeetupField, max: number): string {
    const value = this.form.controls[field].value;
    return `${value.length}/${max}`;
  }

  async cancel(): Promise<void> {
    if (this.form.dirty) {
      const confirmed = await this.confirmDialog.ask({
        title: this.i18n.t('form.confirmLeave.title'),
        message: this.i18n.t('form.confirmLeave.message'),
        confirmLabel: this.i18n.t('form.confirmLeave.confirm'),
        cancelLabel: this.i18n.t('form.confirmLeave.cancel'),
        tone: 'danger',
      });

      if (!confirmed) {
        return;
      }
    }

    await this.router.navigate(this.backLink);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    this.serverError.set(null);
    this.serverFieldErrors.set({});

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: MeetupInput = {
      name: raw.name.trim(),
      dateAndTime: toApiDateTime(raw.dateAndTime),
      organizer: raw.organizer.trim(),
      address: raw.address.trim(),
      description: raw.description.trim(),
    };

    this.saving.set(true);

    try {
      if (this.mode === 'edit') {
        const updated = await firstValueFrom(this.meetupApi.update(this.id, payload));
        this.toasts.success(this.i18n.t('form.saved'));
        await this.router.navigate(['/meetups', updated.id]);
      } else {
        const created = await firstValueFrom(this.meetupApi.create(payload));
        this.toasts.success(this.i18n.t('form.created'));
        await this.router.navigate(['/meetups', created.id]);
      }
    } catch (error) {
      const failure = parseApiError(error, this.i18n.language());
      this.serverFieldErrors.set(failure.fieldErrors);
      this.serverError.set(
        Object.keys(failure.fieldErrors).length > 0 ? null : failure.message,
      );
    } finally {
      this.saving.set(false);
    }
  }

  private serverErrorFor(field: MeetupField): string {
    return this.serverFieldErrors()[field.toLowerCase()] ?? '';
  }
}
