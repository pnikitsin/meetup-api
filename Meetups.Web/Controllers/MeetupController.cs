using Meetups.Application.DTOs;
using Meetups.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Meetups.Web.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public class MeetupController : ControllerBase
    {
        private readonly IMeetupService _meetupService;

        public MeetupController(IMeetupService meetupService)
        {
            _meetupService = meetupService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OutputMeetupDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<OutputMeetupDto>>> GetMeetups(CancellationToken cancellationToken)
        {
            var meetups = await _meetupService.GetMeetupsAsync(cancellationToken);

            return Ok(meetups);
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(OutputMeetupDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<OutputMeetupDto>> GetMeetup(Guid id, CancellationToken cancellationToken)
        {
            var meetup = await _meetupService.GetMeetupAsync(id, cancellationToken);

            return Ok(meetup);
        }

        [HttpPost]
        [ProducesResponseType(typeof(OutputMeetupDto), StatusCodes.Status201Created)]
        public async Task<ActionResult<OutputMeetupDto>> CreateMeetup(InputMeetupDto inputMeetupDto, CancellationToken cancellationToken)
        {
            var meetup = await _meetupService.CreateMeetupAsync(inputMeetupDto, cancellationToken);

            return CreatedAtAction(nameof(GetMeetup), new { id = meetup.Id }, meetup);
        }

        [HttpPut]
        [ProducesResponseType(typeof(OutputMeetupDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<OutputMeetupDto>> UpdateMeetup(Guid id, InputMeetupDto inputMeetupDto, CancellationToken cancellationToken)
        {
            var meetup = await _meetupService.UpdateMeetupAsync(id, inputMeetupDto, cancellationToken);

            return Ok(meetup);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteMeetup(Guid id, CancellationToken cancellationToken)
        {
            await _meetupService.DeleteMeetupAsync(id, cancellationToken);

            return NoContent();
        }
    }
}
