#pragma once
#include "CoreMinimal.h"
#include "FfBitNetPolicy.h"
#include "FfQuantEngine.generated.h"
UCLASS() class FRAMEFORGERUNTIME_API UFfQuantEngine : public UObject {
 GENERATED_BODY() public:
 UPROPERTY() TObjectPtr<UFfBitNetPolicy> Policy;
 UPROPERTY() bool bUseLifFront=false;
 bool Boot() { if (!Policy) Policy=NewObject<UFfBitNetPolicy>(this); return Policy->TryLoadDefault(); }
 int32 Intent(const TArray<float>& Feat) const { return Policy ? Policy->Eval(Feat) : 0; }
};
