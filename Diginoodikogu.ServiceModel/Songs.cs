﻿using ServiceStack;
using ServiceStack.DataAnnotations;

namespace Diginoodikogu.ServiceModel;

[Icon(Svg = Icons.Song)]
[Description("Song Details")]
[Notes("Captures Song information and all related variations of the song")]
public class Laul : AuditBase
{
    public Guid Id { get; set; }
    public string Nimi { get; set; } = default!;
    public string? Sonad { get; set; }
    public string? Viis { get; set; }
    public string? MusicXml { get; set; }
    public string? ChordPro { get; set; }
    public List<string> Kogumikud { get; set; } = default!;
    public string Helistik { get; set; } = default!;
    [Reference]
    public List<Variatsioon> Variatsioonid { get; set; } = default!;
}

[Tag("laulud"), Description("Leia laulud")]
[Route("/laulud", "GET")]
[Route("/laul/{Id}", "GET")]
[AutoApply(Behavior.AuditQuery)]
public class QueryLaulud : QueryDb<Laul>
{
    public Guid? Id { get; set; }
}

[Tag("laulud"), Description("Lisa uus laul")]
[Route("/laulud", "POST")]
[ValidateHasRole(Roles.Sisestaja)]
[AutoApply(Behavior.AuditCreate)]
public class CreateLaul : ICreateDb<Laul>, IReturn<IdResponse>
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [Description("Laulu nimi"), ValidateNotEmpty]
    public required string Nimi { get; set; }
    public string? Sonad { get; set; }
    public string? Viis { get; set; }
    [Input(Type = "tag"), FieldCss(Field = "col-span-12")]
    public List<string> Kogumikud { get; set; } = default!;
    public string? MusicXml { get; set; }
    [Input(Type = "textarea")]
    public string? ChordPro { get; set; }
    public string Helistik { get; set; } = default!;
}

[Tag("laulud"), Description("Uuenda laulu")]
[Route("/laul/{Id}", "PATCH")]
[ValidateHasRole(Roles.Sisestaja)]
[AutoApply(Behavior.AuditModify)]
public class UpdateLaul : IPatchDb<Laul>, IReturn<IdResponse>
{
    public Guid Id { get; set; }
    [Description("Laulu nimi"), ValidateNotEmpty]
    public required string Nimi { get; set; }
    public string? Sonad { get; set; }
    public string? Viis { get; set; }
    public string? MusicXml { get; set; }
    public string? ChordPro { get; set; }
    [Input(Type = "tag"), FieldCss(Field = "col-span-12")]
    public List<string> Kogumikud { get; set; } = default!;
    public string Helistik { get; set; } = default!;
}

[Tag("laulud"), Description("Kustuta laul")]
[Route("/laulud/{Id}", "DELETE")]
[Route("/laul/{Id}", "DELETE")]
[ValidateHasRole(Roles.Admin)]
[AutoApply(Behavior.AuditSoftDelete)]
public class DeleteLaul : IDeleteDb<Laul>, IReturnVoid
{
    public Guid Id { get; set; }
}

[Description("Laulu variandi detailid")]
public class Variatsioon : AuditBase
{
    public Guid Id { get; set; }
    public string Nimetus { get; set; } = default!;
    public string? MusicXml { get; set; }
    public string? ChordPro { get; set; }
    [ForeignKey(typeof(Laul))]
    public Guid LaulId { get; set; }
    public string Helistik { get; set; } = default!;
}

[Tag("variatsioonid")]
[Route("/variatsioonid", "GET")]
[Route("/variatsioonid/{Id}", "GET")]
[Route("/variatsioonid/{LaulId}", "GET")]
[AutoApply(Behavior.AuditQuery)]
public class QueryVariatsioonid : QueryDb<Variatsioon>
{
    public Guid? Id { get; set; }
    public Guid? LaulId { get; set; }

}

[Tag("variatsioonid")]
[Route("/variatsioonid", "POST")]
[ValidateHasRole(Roles.Sisestaja)]
[AutoApply(Behavior.AuditCreate)]
public class CreateVariatsioon : ICreateDb<Variatsioon>, IReturn<IdResponse>
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [ValidateNotEmpty]
    public string Nimetus { get; set; } = default!;
    public string? MusicXml { get; set; }
    public string? ChordPro { get; set; }
    [ForeignKey(typeof(Laul))]
    public Guid LaulId { get; set; }
    public string Helistik { get; set; } = default!;
}

[Tag("variatsioonid")]
[Route("/variatsioonid", "PATCH")]
[ValidateHasRole(Roles.Sisestaja)]
[AutoApply(Behavior.AuditCreate)]
public class UpdateVariatsioon : IUpdateDb<Variatsioon>, IReturn<IdResponse>
{
    public Guid Id { get; set; }
    [ValidateNotEmpty]
    public string Nimetus { get; set; } = default!;
    public string? MusicXml { get; set; }
    public string? ChordPro { get; set; }
    [ForeignKey(typeof(Laul))]
    public Guid LaulId { get; set; }
    public string Helistik { get; set; } = default!;
}

[Description("Kogumik")]
public class Kogumik
{
    [PrimaryKey]
    public string Nimi { get; set; } = default!;
}

[Tag("kogumik")]
[Route("/kogumik", "GET")]
public class QueryKogumikud : QueryDb<Kogumik>
{
}

[Tag("kogumik")]
[Route("/kogumik", "POST")]
[ValidateHasRole(Roles.Sisestaja)]
public class CreateKogumik : ICreateDb<Kogumik>, IReturn<IdResponse>
{
    [ValidateNotEmpty]
    public required string Nimi { get; set; }
}

[Tag("kogumik")]
[Route("/kogumik", "DELETE")]
[ValidateHasRole(Roles.Admin)]
public class DeleteKogumik : IDeleteDb<Kogumik>, IReturnVoid
{
    public required string Nimi { get; set; }
}