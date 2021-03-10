import ReactDOM from 'react-dom'
import React, { useEffect } from 'react'
import { System } from './System'

function App() {
    useEffect(() => {
        const isSafe = System
            .setAvailableResources([3, 3, 2])
            .setProcesses([
                { allocations: [0, 1, 0], needs: [7, 4, 3], isFinish: false },
                { allocations: [2, 0, 0], needs: [1, 2, 2], isFinish: false },
                { allocations: [3, 0, 2], needs: [6, 0, 0], isFinish: false },
                { allocations: [2, 1, 1], needs: [0, 1, 1], isFinish: false },
                { allocations: [0, 0, 2], needs: [4, 3, 1], isFinish: false },
            ])
            .isSafe()
        console.log(isSafe)
    }, [])

    return (
        <div>Hello World!</div>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
)