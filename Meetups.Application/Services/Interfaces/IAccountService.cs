using Meetups.Application.DTOs;

namespace Meetups.Application.Services.Interfaces
{
    public interface IAccountService
    {
        Task<OutputAccountDto> RegisterAsync(RegisterAccountDto registerAccountDto, CancellationToken cancellationToken);
        Task<LoginResultDto> LoginAsync(LoginAccountDto loginAccountDto, CancellationToken cancellationToken);
    }
} 