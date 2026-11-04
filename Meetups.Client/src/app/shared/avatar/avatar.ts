import { Component, computed, input } from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <span
      class="avatar"
      [class]="'avatar--' + size()"
      [style.--avatar-hue]="hue()"
      [attr.title]="name()"
      [attr.aria-label]="name()"
    >
      {{ initials() }}
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: 0 0 auto;
    }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      background: linear-gradient(
        135deg,
        hsl(var(--avatar-hue) 62% 46%),
        hsl(calc(var(--avatar-hue) + 38) 72% 58%)
      );
      color: #fff;
      font-weight: 750;
      letter-spacing: -0.02em;
      line-height: 1;
      text-transform: uppercase;
      box-shadow: 0 2px 6px rgba(20, 25, 43, 0.14);
      user-select: none;
    }

    .avatar--sm {
      width: 1.9rem;
      height: 1.9rem;
      font-size: 0.65rem;
    }

    .avatar--md {
      width: 2.4rem;
      height: 2.4rem;
      font-size: 0.78rem;
    }

    .avatar--lg {
      width: 3.2rem;
      height: 3.2rem;
      font-size: 1rem;
    }

    .avatar--xl {
      width: 4.2rem;
      height: 4.2rem;
      font-size: 1.3rem;
    }
  `,
})
export class Avatar {
  readonly name = input.required<string>();
  readonly size = input<AvatarSize>('md');

  readonly initials = computed(() => {
    const parts = this.name()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return '?';
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2);
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`;
  });

  readonly hue = computed(() => {
    const value = this.name();
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) % 360;
    }

    return hash;
  });
}
