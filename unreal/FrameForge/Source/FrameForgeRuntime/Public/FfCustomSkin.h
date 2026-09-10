#pragma once
#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Misc/Paths.h"
#include "FfCustomSkin.generated.h"
UCLASS(ClassGroup=(FrameForge), meta=(BlueprintSpawnableComponent))
class FRAMEFORGERUNTIME_API UFfCustomSkin : public UActorComponent {
 GENERATED_BODY() public:
 UPROPERTY(EditAnywhere) FString LocalPng;
 UPROPERTY(EditAnywhere) FName Slot=TEXT("cub");
 UPROPERTY(EditAnywhere) bool bEnabled=false;
 UFUNCTION(BlueprintCallable) bool ApplyTo(class USkeletalMeshComponent* Mesh){ return bEnabled && Mesh && !LocalPng.IsEmpty() && FPaths::FileExists(LocalPng); }
};
