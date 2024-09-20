using System.Data;
using ServiceStack.DataAnnotations;
using ServiceStack.OrmLite;

namespace Diginoodikogu.Migrations;

public class Migration1001 : MigrationBase
{
    public class Laul : AuditBase
    {
        [AutoIncrement]
        public int Id { get; set; }
    	[Required]
        public string Nimi { get; set; } = default!;
        public string? Sonad { get; set; }
        public string? Viis { get; set; }
    	[Required]
        public string Helistik { get; set; } = default!;
        public string? MusicXml { get; set; }
        public string? ChordPro { get; set; }
        [References(typeof(Kogumik))]
        public string? Kogumik { get; set; }
        [Reference]
        public List<Variatsioon> Variatsioonid { get; set; } = default!;
    }

    public class Variatsioon : AuditBase
    {
        [AutoIncrement]
        public int Id { get; set; }
        [Required]
        public string Nimetus { get; set; } = default!;
        public string? MusicXml { get; set; }
        public string? ChordPro { get; set; }
        [Required]
        public int LaulId { get; set; }
        public string Helistik { get; set; } = default!;
    }

    public class Kogumik
    {
        [PrimaryKey]
        public string Nimi { get; set; } = default!;
    }

    public override void Up()
    {
        Db.CreateTable<Kogumik>();
        Db.CreateTable<Variatsioon>();
        Db.CreateTable<Laul>();
    }

    public override void Down()
    {
        Db.DropTable<Laul>();
        Db.DropTable<Kogumik>();
        Db.DropTable<Variatsioon>();
    }
}