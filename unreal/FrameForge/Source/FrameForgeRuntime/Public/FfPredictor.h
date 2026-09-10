#pragma once
#include "CoreMinimal.h"
#include "FfTypes.h"
#include "FfPredictor.generated.h"
USTRUCT(BlueprintType)
struct FRAMEFORGERUNTIME_API FFfPredPose { GENERATED_BODY() UPROPERTY() FVector2D P=FVector2D::ZeroVector; UPROPERTY() FVector2D V=FVector2D::ZeroVector; UPROPERTY() int32 Frame=0; };
UCLASS()
class FRAMEFORGERUNTIME_API UFfPredictor : public UObject {
GENERATED_BODY()
public:
 UPROPERTY() float DelaySec=0.1f; UPROPERTY() float RttEwmaMs=80.f; UPROPERTY() float JitterMs=8.f; UPROPERTY() float PadMs=16.f;
 void NoteRttMs(float SampleMs){ RttEwmaMs=RttEwmaMs+(SampleMs-RttEwmaMs)*0.2f; DelaySec=FMath::Clamp((RttEwmaMs*0.5f+JitterMs+PadMs)/1000.f,0.05f,0.18f); }
 int32 DisplayFrame(int32 HostFrame,int32 SimHz=120) const { return FMath::Max(0,HostFrame-FMath::Max(1,FMath::RoundToInt(DelaySec*(float)SimHz))); }
 FFfPredPose Compensate(const FFfPredPose& Auth,float ExtraSec) const { FFfPredPose O=Auth; O.P=Auth.P+Auth.V*ExtraSec; return O; }
 FFfPredPose Blend(const FFfPredPose& A,const FFfPredPose& B,int32 DisplayFrame) const;
};
