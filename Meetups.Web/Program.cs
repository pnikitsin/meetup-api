using Meetups.Application.AutoMapper;
using Meetups.Application.Services.Implementations;
using Meetups.Application.Services.Interfaces;
using Meetups.Domain.Interfaces;
using Meetups.Infrastructure.Data;
using Meetups.Web.Extensions;
using Meetups.Web.Middleware;
using Meetups.Web.OpenApi;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration);
});

builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddAccessToken(builder.Configuration);
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddTransient<IMeetupService, MeetupService>();
builder.Services.AddTransient<IAccountService, AccountService>();
builder.Services.AddTransient<ITokenService, TokenService>();
builder.Services.AddAutoMapper(cfg =>
{
    var licenseKey = builder.Configuration["AutoMapper:LicenseKey"];
    if (!string.IsNullOrWhiteSpace(licenseKey))
    {
        cfg.LicenseKey = licenseKey;
    }
}, typeof(AutoMapperProfile));

builder.Services.AddRouting(options
    => options.LowercaseUrls = true);

builder.Services.AddControllers();
builder.Services.AddOpenApi(options =>
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>());

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options => options
        .WithTitle("Meetup API")
        .WithTheme(ScalarTheme.Moon)
        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient)
        .DisableAgent());
}

app.UseMiddleware<ErrorHandlerMiddleware>();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();