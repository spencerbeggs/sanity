import {useEffect} from 'react'
import {getPublishedId} from 'sanity'

import {usePane} from '../../../structure/components'
import {type ActiveDocument, useTasks} from '../../src/tasks/context'

export function SetActiveDocument(document: ActiveDocument) {
  const {documentId, documentType} = document
  const {isLast} = usePane()
  const {setActiveDocument} = useTasks()

  useEffect(() => {
    if (documentId && isLast && documentType) {
      setActiveDocument?.({
        documentId: getPublishedId(documentId),
        documentType,
      })
    }

    return () => {
      if (isLast) {
        setActiveDocument?.(null)
      }
    }
  }, [documentId, documentType, isLast, setActiveDocument])

  return null
}
