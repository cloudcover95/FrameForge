#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "FfItemActor.generated.h"
UCLASS() class FRAMEFORGERUNTIME_API AFfItemActor : public AActor {
 GENERATED_BODY() public:
 AFfItemActor() { PrimaryActorTick.bCanEverTick=false; Root=CreateDefaultSubobject<USceneComponent>(TEXT("Root")); SetRootComponent(Root); Id=TEXT("heart"); }
 UPROPERTY(VisibleAnywhere) TObjectPtr<USceneComponent> Root;
 UPROPERTY(EditAnywhere) FName Id; UPROPERTY() FVector2D SimPos=FVector2D::ZeroVector;
 void SyncDisplay() { SetActorLocation(FVector(SimPos.X*10.f,0.f,SimPos.Y*10.f)); }
};
