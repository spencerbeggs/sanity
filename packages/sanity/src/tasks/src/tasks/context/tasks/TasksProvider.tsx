import {useCallback, useMemo, useState} from 'react'
import {useAddonDataset} from 'sanity'

import {useTasksStore} from '../../store'
import {TasksContext} from './TasksContext'
import {type ActiveDocument, type TasksContextValue} from './types'
import {useTaskOperations} from './useTaskOperations'

interface TasksProviderProps {
  children: React.ReactNode
}

const EMPTY_ARRAY: [] = []

/**
 * @internal
 */
export function TasksProvider(props: TasksProviderProps) {
  const {children} = props
  // TODO: Get this state into the router?
  const [isOpen, setIsOpen] = useState(false)
  const [activeDocument, setActiveDocument] = useState<ActiveDocument | null>(null)

  const {client, createAddonDataset} = useAddonDataset()
  const {data = EMPTY_ARRAY, isLoading} = useTasksStore({
    client,
  })
  const operations = useTaskOperations({client, createAddonDataset})

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const value: TasksContextValue = useMemo(
    () => ({
      activeDocument,
      setActiveDocument,
      isOpen,
      toggleOpen,
      isLoading,
      data: data ?? [],
      operations,
    }),
    [activeDocument, data, isLoading, isOpen, operations, toggleOpen],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}
