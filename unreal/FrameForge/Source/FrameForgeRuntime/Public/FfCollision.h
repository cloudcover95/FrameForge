#pragma once
#include "CoreMinimal.h"
#include "Engine/EngineTypes.h"
namespace FfCollision {
 inline constexpr ECollisionChannel Sim=ECC_GameTraceChannel1;
 inline constexpr ECollisionChannel Dress=ECC_GameTraceChannel2;
 inline constexpr ECollisionChannel Blast=ECC_GameTraceChannel3;
 inline constexpr ECollisionChannel Item=ECC_GameTraceChannel4;
}
