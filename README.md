# Meetups API

REST API for managing meetups: JWT authentication, meetup CRUD, Scalar documentation.
Stack: .NET 10, ASP.NET Core, EF Core + SQL Server, AutoMapper, BCrypt, OpenAPI + Scalar, Serilog.
Layers: `Domain` → `Application` → `Infrastructure` → `Web`.

## Running

Requires .NET SDK 10 and SQL Server. Secrets are kept in User Secrets (Development only):

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=127.0.0.1,1433;Database=meetups;User Id=sa;Password=<password>;TrustServerCertificate=True" --project Meetups.Web
dotnet user-secrets set "Token:Key" "<at least 32 characters>" --project Meetups.Web
dotnet user-secrets set "AutoMapper:LicenseKey" "<key>" --project Meetups.Web   # optional

dotnet run --project Meetups.Web --launch-profile https
```

Migrations are applied on startup. UI: https://localhost:7157/scalar · OpenAPI: `/openapi/v1.json` (Development only).

## API

| Method | Path | Access |
|---|---|---|
| POST | `/api/account/register`, `/api/account/login` | anonymous |
| GET | `/api/meetup`, `/api/meetup/{id:guid}` | JWT |
| POST / PUT / DELETE | `/api/meetup` (`PUT ?id={id}`) | JWT |

The token goes in the `Authorization: Bearer <token>` header. Errors: `{ "error": "..." }` with 400/401/404/409/500.

## Web client

`Meetups.Client` — Angular 22 SPA (standalone, zoneless, Bootstrap 5) for this API. It covers
authentication, dashboard, meetup list with search/filters/sorting, detail page with ICS export,
create/edit forms and delete confirmation, with RU/EN localization.

```powershell
cd Meetups.Client
npm install
npm start        # http://localhost:4200, proxies /api to https://localhost:7157
```

The default dev proxy targets the HTTPS profile (`https://localhost:7157`, self-signed
certificate accepted). Run the API with `dotnet run --project Meetups.Web --launch-profile https`.
If the API is started HTTP-only (`dotnet run --project Meetups.Web`, port 5234), use
`npm run start:http` in `Meetups.Client`.
