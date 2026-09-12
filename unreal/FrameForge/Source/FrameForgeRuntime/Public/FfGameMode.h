#pragma once
#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "FfGameMode.generated.h"

UCLASS()
class FRAMEFORGERUNTIME_API AFfGameMode : public AGameModeBase {
	GENERATED_BODY()
public:
	AFfGameMode() { DefaultPawnClass = APawn::StaticClass(); }
};
