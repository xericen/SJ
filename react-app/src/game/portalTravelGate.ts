export const PORTAL_TRAVEL_RETRY_MS=500;

export type PortalTravelRequest=(accept:()=>void)=>void;

export function isPortalChargePositionHeld(distance:number,activationRadius:number){
  return Number.isFinite(distance)&&distance<activationRadius;
}

export class PortalTravelGate {
  private startedAt=-1;
  private lastRequestAt=-1;
  private accepted=false;

  constructor(private readonly retryMs=PORTAL_TRAVEL_RETRY_MS){}

  get isCharging(){return this.startedAt>=0}

  reset(){
    this.startedAt=-1;
    this.lastRequestAt=-1;
    this.accepted=false;
  }

  update(nowMs:number,durationSeconds:number,request:PortalTravelRequest){
    if(this.startedAt<0)this.startedAt=nowMs;
    const elapsedSeconds=Math.max(0,(nowMs-this.startedAt)/1000);
    const progress=Math.min(1,elapsedSeconds/durationSeconds);
    const retryReady=this.lastRequestAt<0||nowMs-this.lastRequestAt>=this.retryMs;
    if(progress>=1&&!this.accepted&&retryReady){
      this.lastRequestAt=nowMs;
      request(()=>{this.accepted=true});
    }
    return {elapsedSeconds,progress,accepted:this.accepted};
  }
}
