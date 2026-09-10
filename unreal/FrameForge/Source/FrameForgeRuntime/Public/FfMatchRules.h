#pragma once
#include "CoreMinimal.h"
#include "Engine/DeveloperSettings.h"
#include "FfMatchRules.generated.h"
UCLASS(Config=Game, DefaultConfig, meta=(DisplayName="FrameForge Match"))
class FRAMEFORGERUNTIME_API UFfMatchRules : public UDeveloperSettings {
 GENERATED_BODY() public:
 UPROPERTY(EditAnywhere, Config) int32 Stocks=4;
 UPROPERTY(EditAnywhere, Config) bool bItems=false;
 UPROPERTY(EditAnywhere, Config) bool bWalls=false;
 UPROPERTY(EditAnywhere, Config) bool bWalkOffs=false;
 UPROPERTY(EditAnywhere, Config) bool bHazards=false;
 UPROPERTY(EditAnywhere, Config) int32 MaxSlots=4;
 UPROPERTY(EditAnywhere, Config) bool bRecordTimeline=true;
};
