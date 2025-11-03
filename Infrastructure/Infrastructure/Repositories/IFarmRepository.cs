using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public interface IFarmRepository
    {
        Task<IList<Farm>> GetFarms();
        Task<Farm> GetFarm(Guid id);
        Task Save(Farm famr);
        Task UpDate(Farm famr);
    }
}
