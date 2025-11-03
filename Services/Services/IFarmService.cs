using Domain;
using Services.Models.CowModels;
using Services.Models.FarmModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public interface IFarmService
    {
        Task AddFarm(AddFarmModel model);
        Task <IList<FarmModel>> GetFarms();
        Task<FarmModel> GetFarm(Guid id);
        Task AddCow(AddCowModel model);
    }
}
