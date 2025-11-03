using AutoMapper;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Services;
using Services.Models.CowModels;
using Services.Models.FarmModels;

namespace MvcSample.Controllers
{
    public class FarmController : Controller
    {

        private IFarmService FarmService { get; set; }
      

       public FarmController(IFarmService farmService)
        {
            FarmService = farmService;
            
        }

        public async Task<IActionResult>Index()
        {
            IList<FarmModel> farms = await FarmService.GetFarms();
            return View(farms);
        }

        public async Task<IActionResult> AddFarm()
        {
            AddFarmModel model = new AddFarmModel();
            return View(model);
        }
        [HttpPost]
        public async Task<IActionResult> AddFarm(AddFarmModel model)
        {
            if(ModelState.IsValid)
            {
                ///save farm
                try
                {
                    await FarmService.AddFarm(model);
                    return RedirectToAction("Index", "Farm");
                }
                catch(Exception e)
                {
                    ModelState.AddModelError(string.Empty, "An error occurred while adding the farm.");
                    ViewBag.Error = e.Message;
                    return View(model);
                }
                
            }

            return View(model);
        }

        public async Task<IActionResult> AddCow(Guid id)
        {
            AddCowModel model = new AddCowModel();
            model.FarmId = id;
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> AddCow(AddCowModel model)
        {
            if (ModelState.IsValid)
            {
                ///save farm
                try
                {
                    await FarmService.AddCow(model);
                    return RedirectToAction("Index", "Farm");
                }
                catch (Exception e)
                {
                    ModelState.AddModelError(string.Empty, "An error occurred while adding the cow.");
                    ViewBag.Error = e.Message;
                    return View(model);
                }

            }

            return View(model);
        }
    }
}
