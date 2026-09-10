#pragma once
#include "CoreMinimal.h"
#include "Engine/DeveloperSettings.h"
#include "FfLookFlags.generated.h"
UCLASS(Config=Game, DefaultConfig, meta=(DisplayName="FrameForge Look"))
class FRAMEFORGERUNTIME_API UFfLookFlags : public UDeveloperSettings {
 GENERATED_BODY() public:
 UPROPERTY(EditAnywhere,Config,Category="Lumen") bool bLumenReflections=false;
 UPROPERTY(EditAnywhere,Config,Category="Lumen") bool bLumenGi=false;
 UPROPERTY(EditAnywhere,Config,Category="Chaos") bool bChaosFighterMesh=false;
 UPROPERTY(EditAnywhere,Config,Category="BitNet") bool bBitNetKnockbackScale=false;
};
