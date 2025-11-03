
using AutoMapper;
using Infrastructure;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Services;
using Services.Automapper;

namespace MvcSample
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var _configuration = builder.Configuration;
            // Add services to the container.
            builder.Services.AddServices();
            builder.Services.AddRepositories(_configuration);
            builder.Services.AddDatabaseDeveloperPageExceptionFilter();
            // Add automapper
            var mappingConfiguration = new MapperConfiguration (m => m.AddProfile(new MappingProfile()));
            IMapper mapper = mappingConfiguration.CreateMapper();
            
            builder.Services.AddSingleton(mapper);

            builder.Services.AddCors(p => p.AddPolicy("CORS_Policy", builder =>
            {
                CorsPolicyBuilder corsPolicyBuilder = builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader(); //builder.WithOrigins("*").AllowAnyMethod().AllowAnyHeader();
            }));

            builder.Services.AddControllersWithViews();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseMigrationsEndPoint();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();
            app.UseCors("CORS_Policy");
           
            app.MapControllers();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");
            //app.MapRazorPages();

            app.Run();
        }
    }
}
