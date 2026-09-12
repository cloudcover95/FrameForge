using UnrealBuildTool;

public class FrameForgeEditor : ModuleRules
{
	public FrameForgeEditor(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
		PublicDependencyModuleNames.AddRange(new[] { "Core", "CoreUObject", "Engine", "UnrealEd", "FrameForgeRuntime" });
	}
}
