using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Enums
{
    public enum EquipmentType
    {
        Tractor,
        Plow,
        Harvester,
        Seeder,
        Sprayer
    }

    public enum EquipmentStatus
    {
        Available,
        InUse,
        UnderMaintenance,
        Decommissioned
    }   
}
