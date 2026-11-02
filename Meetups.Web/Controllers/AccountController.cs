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
        [ProducesResponseType(typeof(RegisterResultDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<RegisterResultDto>> Register(RegisterAccountDto inputAccountDto, CancellationToken cancellationToken)
        {
            var account = await _accountService.RegisterAsync(inputAccountDto, cancellationToken);

            return StatusCode(StatusCodes.Status201Created, account);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<LoginResultDto>> Login(LoginAccountDto loginAccountDto, CancellationToken cancellationToken)
        {
            var result = await _accountService.LoginAsync(loginAccountDto, cancellationToken);

            return Ok(result);
        }
    }
}