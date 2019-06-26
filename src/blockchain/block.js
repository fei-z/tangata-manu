// flow
export default class Block {
  hash: string

  prevHash: string

  slot: number

  epoch: number

  height: number

  txs: any

  isEBB: boolean

  constructor({
    hash, slot, epoch, height, txs, isEBB, prevHash,
  }) {
    this.hash = hash
    this.prevHash = prevHash
    this.slot = slot
    this.epoch = epoch
    this.height = height
    this.txs = txs
    this.isEBB = isEBB
  }

  serialize() {
    return {
      block_hash: this.hash,
      epoch: this.epoch,
      slot: this.slot,
      block_height: this.height,
    }
  }
}
