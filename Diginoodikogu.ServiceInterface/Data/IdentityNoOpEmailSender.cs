using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace Diginoodikogu.Data;

/// <summary>
/// To send real emails, configure SmtpConfig in appsettings.json and register EmailSender instead
/// </summary>
public sealed class IdentityNoOpEmailSender : IEmailSender<ApplicationUser>
{
    private readonly IEmailSender emailSender = new NoOpEmailSender();

    public Task SendConfirmationLinkAsync(ApplicationUser user, string email, string confirmationLink) =>
        emailSender.SendEmailAsync(email, "Kinnita oma e-posti aadressi", $"Oma konto aktiveerimiseks <a href='{confirmationLink}'>vajuta siia</a>.");

    public Task SendPasswordResetLinkAsync(ApplicationUser user, string email, string resetLink) =>
        emailSender.SendEmailAsync(email, "Reset your password", $"Parooli lähtestamiseks <a href='{resetLink}'>vajuta siia</a>.");

    public Task SendPasswordResetCodeAsync(ApplicationUser user, string email, string resetCode) =>
        emailSender.SendEmailAsync(email, "Reset your password", $"Lähtesta parool kasutades järgnevat koodi: {resetCode}");
}