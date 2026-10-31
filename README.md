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

dotnet run --project Meetups.Web
```

Migrations are applied on startup. UI: http://localhost:5234/scalar · OpenAPI: `/openapi/v1.json` (Development only).

## API

| Method | Path | Access |
|---|---|---|
| POST | `/api/account/register`, `/api/account/login` | anonymous |
| GET | `/api/meetup`, `/api/meetup/{id:guid}` | JWT |
| POST / PUT / DELETE | `/api/meetup` (`PUT ?id={id}`) | JWT |

The token goes in the `Authorization: Bearer <token>` header. Errors: `{ "error": "..." }` with 400/401/404/409/500.
