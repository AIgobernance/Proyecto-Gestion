using System.ComponentModel.DataAnnotations;

namespace Domain
{
    public class Farm
    {
        [Key]
        public Guid Id { get; set; } = Guid.Empty;
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public List<Cow> Cows { get; set; } = new List<Cow>();

        public int getTotalLitters()
        {
            int liters = 0;
            foreach(var cow in Cows)
            {
                liters = liters + cow.getTotalLiters();
            }
            return liters;
        }
        
    }
}
