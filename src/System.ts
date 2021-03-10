interface Process {
    /**
     * 进程还需要各种资源数量
     */
    needs: number[]
    /**
     * 当前已经给该进程分配的各种资源数量
     */
    allocations: number[]
    /**
     * 进程是否结束
     */
    isFinish: boolean

}

export const System = new class {
    /**
     * 系统进程
     */
    private _processes: Process[] = []
    /**
     * 系统资源当前可用总量
     */
    private _availableResources: number[] = []
    /**
     * 当前可分配资源
     */
    private _work: number[] = []
    /**
     * 安全序列
     */
    private _safeSequence: number[] = []

    public get totalProcesses(): number {
        return this._processes.length
    }

    public setProcesses(processes: Process[]) {
        this._processes = processes
        return this
    }

    public setAvailableResources(resources: number[]) {
        this._availableResources = resources
        return this
    }

    /**
     * 安全判定算法
     */
    public isSafe() {
        // 初始化
        this._work = this._availableResources // 动态记录当前剩余资源
        this._processes.forEach(process => process.isFinish = false) // 设定所有进程均未完成
        this._safeSequence = [] // 设置安全序列为空

        // 不断查找可执行进程 (未完成但目前资源可满足其需要，这样的进程是能够完成的)
        while (true) {
            let isFound = false // 是否在未完成的进程中找到可执行进程

            for (const [i, proc] of this._processes.entries()) {
                // 忽略已完成的进程
                if (proc.isFinish) {
                    continue
                }

                // 如果存在可执行进程，则该进程一定能完成，并归还其占用的资源
                if (!proc.isFinish && proc.needs.every((need, i) => need <= this._work[i])) {
                    proc.isFinish = true
                    proc.allocations.forEach((alloc, i) => this._work[i] += alloc)
                    isFound = true
                    this._safeSequence.push(i)
                }
            }

            // 如果找不到可执行进程了，则可能有两种情况
            // 1. 所有进程都已完成，系统是安全的
            // 2. 至少存在一个进程不可执行，存在死锁，此时系统是不安全的
            if (!isFound) break
        }

        // 系统是否安全的依据是所有进程是否都已成功执行结束
        const isSafe = this._processes.every(({ isFinish }) => isFinish)

        // 打印安全序列
        if (isSafe) {
            console.log(this._safeSequence)
        }

        return isSafe
    }

    /**
     * 资源请求算法
     * 
     * @param process 需要申请资源的进程
     * @param requests 需要申请的资源数
     * 
     * @returns 
     */
    public requestResource(process: Process, requests: number[]): boolean {
        // 如果申请的资源大于该进程需要的资源，则申请失败
        // (规则：进程实际申请的资源不能大于其需要的资源)
        if (requests.some((request, i) => request > process.needs[i])) {
            return false
        }

        // 如果申请的资源大于系统剩余可用的资源，则申请失败
        if (requests.some((requests, i) => requests > this._availableResources[i])) {
            return false
        }

        // 尝试分配资源
        requests.forEach((request, i) => {
            this._availableResources[i] -= request
            process.allocations[i] += request
            process.needs[i] -= request
        })

        // 调用安全判定算法，检查系统是否安全
        if (this.isSafe()) {
            return true
        } else {
            // 申请失败，资源回滚
            requests.forEach((request, i) => {
                this._availableResources[i] += request
                process.allocations[i] -= request
                process.needs[i] += request
            })
            return false
        }
    }
}