using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace Meetups.Web.OpenApi
{
    /// <summary>
    /// Описывает JWT Bearer-схему в OpenAPI-документе, чтобы Scalar показывал
    /// форму авторизации и подставлял токен в защищённые запросы.
    /// </summary>
    internal sealed class BearerSecuritySchemeTransformer : IOpenApiDocumentTransformer
    {
        public Task TransformAsync(
            OpenApiDocument document,
            OpenApiDocumentTransformerContext context,
            CancellationToken cancellationToken)
        {
            document.Components ??= new OpenApiComponents();
            document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

            document.Info ??= new OpenApiInfo();
            document.Info.Title = "Meetup API";

            document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "JWT from POST /api/account/login (access_token field)."
            };

            document.Security ??= [];
            document.Security.Add(new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] = []
            });

            return Task.CompletedTask;
        }
    }
}
