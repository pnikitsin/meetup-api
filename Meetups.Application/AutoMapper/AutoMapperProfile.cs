using AutoMapper;
using Meetups.Application.DTOs;
using Meetups.Domain.Entities;

namespace Meetups.Application.AutoMapper
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<InputMeetupDto, Meetup>();
            CreateMap<Meetup, OutputMeetupDto>();
            CreateMap<RegisterAccountDto, Account>();
            CreateMap<Account, RegisterResultDto>();
        }
    }
}