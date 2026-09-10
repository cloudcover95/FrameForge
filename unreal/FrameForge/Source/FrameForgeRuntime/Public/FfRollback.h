#pragma once
#include "CoreMinimal.h"
#include "FfTypes.h"
#include "FfRollback.generated.h"
USTRUCT() struct FRAMEFORGERUNTIME_API FFfRbPose { GENERATED_BODY() UPROPERTY() int32 Frame=0; UPROPERTY() TArray<FFfInput> Inputs; };
UCLASS() class FRAMEFORGERUNTIME_API UFfRollback : public UObject { GENERATED_BODY()
public: UPROPERTY() int32 Depth=8; UPROPERTY() int32 Confirmed=0;
 void Push(int32 Frame,const TArray<FFfInput>& Inputs);
 bool NeedsResim(int32 Frame,int32 Slot,const FFfInput& Late) const;
private: UPROPERTY() TArray<FFfRbPose> Buf; };
