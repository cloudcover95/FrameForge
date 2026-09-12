using UnrealBuildTool;

public class FrameForgeHost : ModuleRules
{
	public FrameForgeHost(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
		PublicDependencyModuleNames.AddRange(new[] { "Core", "CoreUObject", "Engine", "InputCore", "FrameForgeRuntime" });
	}
}
