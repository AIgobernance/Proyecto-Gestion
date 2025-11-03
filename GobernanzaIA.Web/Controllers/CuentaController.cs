using GobernanzaIA.Aplicacion.DTOs;
using GobernanzaIA.Aplicacion.Servicios;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System;
using System.Threading.Tasks;

namespace GobernanzaIA.Web.Controllers
{
    public class CuentaController : Controller
    {
        private readonly ServicioAutenticacion _servicioAutenticacion;

        public CuentaController(ServicioAutenticacion servicioAutenticacion)
        {
            _servicioAutenticacion = servicioAutenticacion;
        }

        [HttpGet]
        public IActionResult Registrar()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Registrar(RegistrarUsuarioDto registroDto)
        {
            if (!ModelState.IsValid)
                return View(registroDto);

            var resultado = await _servicioAutenticacion.RegistrarUsuarioAsync(registroDto);

            if (resultado.Exitoso)
            {
                TempData["Exito"] = "Usuario registrado correctamente";
                return RedirectToAction("Login");
            }

            ModelState.AddModelError("", resultado.Error);
            return View(registroDto);
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return View(loginDto);

            var resultado = await _servicioAutenticacion.LoginAsync(loginDto);

            if (resultado.RequiereDosFactores && resultado.Usuario != null)
            {
                TempData["UsuarioId2FA"] = resultado.Usuario.Id.ToString();
                return RedirectToAction("Verificar2FA");
            }

            if (resultado.Exitoso && resultado.Usuario != null)
            {
                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, resultado.Usuario.Id.ToString()),
                    new Claim(ClaimTypes.Email, resultado.Usuario.Email)
                };
                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var principal = new ClaimsPrincipal(identity);
                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

                return RedirectToAction("Index", "Home");
            }

            ModelState.AddModelError("", resultado.Error);
            return View(loginDto);
        }

        [HttpGet]
        public IActionResult Verificar2FA()
        {
            var usuarioId = TempData["UsuarioId2FA"] as string;
            if (string.IsNullOrEmpty(usuarioId))
                return RedirectToAction("Login");

            // Mantener en TempData para el POST
            TempData.Keep("UsuarioId2FA");

            var model = new Verificar2FADto { UsuarioId = usuarioId };
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Verificar2FA(Verificar2FADto model)
        {
            if (!ModelState.IsValid)
                return View(model);

            if (!Guid.TryParse(model.UsuarioId, out var usuarioGuid))
            {
                ModelState.AddModelError("", "Usuario inválido");
                return View(model);
            }

            var resultado = await _servicioAutenticacion.VerificarCodigoDosFactoresAsync(usuarioGuid, model.Codigo);

            if (resultado.Exitoso && resultado.Usuario != null)
            {
                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, resultado.Usuario.Id.ToString()),
                    new Claim(ClaimTypes.Email, resultado.Usuario.Email)
                };
                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var principal = new ClaimsPrincipal(identity);
                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

                return RedirectToAction("Index", "Home");
            }

            ModelState.AddModelError("", resultado.Error);
            return View(model);
        }
    }
}
