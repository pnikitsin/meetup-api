using System.Text.Json.Serialization;

namespace Meetups.Application.DTOs
{
    public class LoginResultDto
    {
        public string Username { get; set; } = string.Empty;

        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;
    }
}
