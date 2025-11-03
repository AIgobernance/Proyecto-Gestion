namespace Services.Models.FarmModels
{
    public class FarmModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int CowCount { get; set; }
        public int TotalMilkLitters { get; set; }
    }
}
