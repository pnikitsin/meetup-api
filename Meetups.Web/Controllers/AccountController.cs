using Meetups.Application.DTOs;
using Meetups.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Meetups.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterAccountDto inputAccountDto, CancellationToken cancellationToken)
        {
            var account = await _accountService.RegisterAsync(inputAccountDto, cancellationToken);

            return Ok(account);
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResultDto>> Login(LoginAccountDto loginAccountDto, CancellationToken cancellationToken)
        {
            var result = await _accountService.LoginAsync(loginAccountDto, cancellationToken);

            return Ok(result);
        }
    }
}