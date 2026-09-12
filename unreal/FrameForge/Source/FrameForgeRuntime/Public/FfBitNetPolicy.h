#pragma once
#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "FfBitNetPolicy.generated.h"

/** Loads Generated/policy.ffbn. Intent logits only. Never writes knockback. */
UCLASS()
class FRAMEFORGERUNTIME_API UFfBitNetPolicy : public UObject {
	GENERATED_BODY()
public:
	UPROPERTY() int32 Rows = 6;
	UPROPERTY() int32 Cols = 8;
	UPROPERTY() float Scale = 1.f;
	TArray<int8> Ternary;
	bool bLoaded = false;

	bool TryLoadDefault() {
		const FString Path = FPaths::ProjectPluginsDir() / TEXT("FrameForge/Content/Generated/policy.ffbn");
		TArray<uint8> Buf;
		if (!FFileHelper::LoadFileToArray(Buf, *Path) || Buf.Num() < 16) {
			bLoaded = false;
			return false;
		}
		if (!(Buf[0]=='F' && Buf[1]=='F' && Buf[2]=='B' && Buf[3]=='N')) return false;
		bLoaded = true;
		return true;
	}

	int32 Eval(const TArray<float>& Feat) const {
		if (!bLoaded || Ternary.Num() == 0) return 0;
		TArray<float> Logits;
		Logits.Init(0.f, Rows);
		for (int32 r = 0; r < Rows; ++r) {
			float acc = 0.f;
			const int32 base = r * Cols;
			for (int32 c = 0; c < Cols && c < Feat.Num(); ++c) {
				const int8 w = Ternary[base + c];
				if (w == 0) continue;
				acc += (w > 0) ? Feat[c] : -Feat[c];
			}
			Logits[r] = acc * Scale;
		}
		int32 best = 0;
		for (int32 i = 1; i < Logits.Num(); ++i) if (Logits[i] > Logits[best]) best = i;
		return best;
	}
};
