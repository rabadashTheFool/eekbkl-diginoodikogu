using Microsoft.EntityFrameworkCore;
using ServiceStack.Data;
using ServiceStack.OrmLite;
using Diginoodikogu.Data;

[assembly: HostingStartup(typeof(Diginoodikogu.ConfigureDb))]

namespace Diginoodikogu;

public class ConfigureDb : IHostingStartup
{
    public void Configure(IWebHostBuilder builder) => builder
        .ConfigureServices((context, services) => {
            var connectionString = context.Configuration.GetConnectionString("DefaultConnection");
            
            services.AddSingleton<IDbConnectionFactory>(new OrmLiteConnectionFactory(
                connectionString, PostgreSqlDialect.Provider));

            // $ dotnet ef migrations add CreateIdentitySchema
            // $ dotnet ef database update
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString, b => b.MigrationsAssembly(nameof(Diginoodikogu))));
            
            // Enable built-in Database Admin UI at /admin-ui/database
            services.AddPlugin(new AdminDatabaseFeature());
        });
}