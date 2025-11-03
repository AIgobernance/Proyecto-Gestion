

using Services.Models.MilkModels;

namespace Services.Models.CowModels
{
    public class AddCowModel
    {
        public Guid FarmId { get; set; }
        public string Race { get; set; } = string.Empty;
        
    }

}
