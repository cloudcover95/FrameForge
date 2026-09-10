#pragma once
#include "CoreMinimal.h"
#include "FfOnline.generated.h"
UENUM(BlueprintType) enum class EFfOnlineBackend : uint8 { Offline, ListenIp, Steam, Eos };
UCLASS(Config=Game, DefaultConfig) class FRAMEFORGERUNTIME_API UFfOnlineSettings : public UObject {
 GENERATED_BODY() public:
 UPROPERTY(EditAnywhere,Config) EFfOnlineBackend Backend=EFfOnlineBackend::ListenIp;
 UPROPERTY(EditAnywhere,Config) int32 MaxPawns=4;
 bool UsesSdk() const { return Backend==EFfOnlineBackend::Steam||Backend==EFfOnlineBackend::Eos; }
};
