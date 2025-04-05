using Diginoodikogu.ServiceInterface;
using ServiceStack.NativeTypes.TypeScript;

[assembly: HostingStartup(typeof(Diginoodikogu.AppHost))]

namespace Diginoodikogu;

public class AppHost() : AppHostBase("Diginoodikogu"), IHostingStartup
{
    public void Configure(IWebHostBuilder builder) => builder
        .ConfigureServices((context, services) => {
            // Configure ASP.NET Core IOC Dependencies
            services.AddSingleton(new AppConfig {
                AppBaseUrl = context.HostingEnvironment.IsDevelopment()
                    ? "https://localhost:5173"  
                    : null,
                ApiBaseUrl = context.HostingEnvironment.IsDevelopment()
                    ? "https://localhost:5001"  
                    : null,
            });
        });

    // Configure your AppHost with the necessary configuration and dependencies your App needs
    public override void Configure()
    {
        SetConfig(new HostConfig {
        });

        TypeScriptGenerator.InsertTsNoCheck = true;
    }
    
    // TODO: Replace with your own License Key. FREE Individual or OSS License available from: https://servicestack.net/free
    public static void RegisterKey() =>
        Licensing.RegisterLicense("OSS Apache-2.0 2025 https://github.com/rabadashTheFool/eekbkl-diginoodikogu Xzf6Xu3WHK1W7SIjBIocoWH6GZtX57fzWf5XBIOsBHJqySAst27pvJmti2hYPyrYFb/AbWxa8PoEvbpNfN6mUzrBNF0guAuhQ7ZBcclOKs62Ggi9lS0jvCdathYq6L7BaHugEQzE4PjvA2wD9wv18b515kuJ1V7J8YCF7+Nl6TQ=");    
}
