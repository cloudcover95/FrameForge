#pragma once
#include "CoreMinimal.h"
#include "FfTimeline.h"
#include "FfReplay.generated.h"
USTRUCT(BlueprintType) struct FRAMEFORGERUNTIME_API FFfReplayHeader {
 GENERATED_BODY() UPROPERTY() int32 SimHz=120; UPROPERTY() int32 SnapshotHz=20;
 UPROPERTY() FName StageId=TEXT("alpine_glass"); UPROPERTY() int32 Slots=2;
};
UCLASS() class FRAMEFORGERUNTIME_API UFfReplay : public UObject {
 GENERATED_BODY() public:
 UPROPERTY() FFfReplayHeader Header; UPROPERTY() TArray<FFfPose> Frames;
 void Capture(UFfTimeline* Ring, int32 Count=240);
 bool Peek(int32 Frame, FFfPose& Out) const;
};
