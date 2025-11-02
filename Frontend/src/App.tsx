import { useState } from 'react'
import Button from './style'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Button>Click me</Button>
      <div>count is {count}</div>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
      <Button onClick={() => setCount(count - 1)}>Decrement</Button>
      <Button onClick={() => setCount(0)}>Reset</Button>
    </>
  )
}

export default App
