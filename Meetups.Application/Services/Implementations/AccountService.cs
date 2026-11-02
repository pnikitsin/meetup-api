using AutoMapper;
using Meetups.Application.DTOs;
using Meetups.Application.Exceptions;
using Meetups.Application.Services.Interfaces;
using Meetups.Domain.Entities;
using Meetups.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;

namespace Meetups.Application.Services.Implementations
{
    public class AccountService : IAccountService
    {
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public AccountService(
            ITokenService tokenService,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IConfiguration configuration)
        {
            _tokenService = tokenService;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<RegisterResultDto> RegisterAsync(RegisterAccountDto inputAccountDto, CancellationToken cancellationToken)
        {
            var account = await _unitOfWork.Accounts.GetAsync(account => account.Email == inputAccountDto.Email, cancellationToken);

            if (account != null)
            {
                throw new AlreadyExistsException("Email is taken.");
            }

            account = new Account()
            {
                Username = inputAccountDto.Username,
                Email = inputAccountDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(inputAccountDto.Password)
            };

            await _unitOfWork.Accounts.AddAsync(account, cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);

            return _mapper.Map<RegisterResultDto>(account);
        }

        public async Task<LoginResultDto> LoginAsync(LoginAccountDto loginAccountDto, CancellationToken cancellationToken)
        {
            var account = await _unitOfWork.Accounts.GetAsync(account => account.Email == loginAccountDto.Email, cancellationToken)
                ?? throw new UnauthorizedException("Email is incorrect.");

            var isValidPassword = BCrypt.Net.BCrypt.Verify(loginAccountDto.Password, account.Password);

            if (isValidPassword == false)
            {
                throw new UnauthorizedException("Password is incorrect.");
            }

            var authClaims = new List<Claim>
            {
               new Claim(ClaimTypes.Name, account.Username)
            };

            var secretKey = _configuration.GetSection("Token:Key").Value!;
            var token = _tokenService.GenerateToken(authClaims, secretKey);

            return new LoginResultDto
            {
                Username = account.Username,
                AccessToken = token
            };
        }
    }
}