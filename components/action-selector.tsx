"use client"

import React, { useEffect, useState } from 'react'
import { MultiSelect, MultiSelectItem } from './ui/multi-select'
import { useSession } from 'next-auth/react';
import { useToast } from './ui/use-toast';
import { ActionEntity, Resource } from '@/types';
import { Session } from 'next-auth';

interface ActionSelectorProps {
    resourceId:string;
    selectedResourceActions: Map<string, ActionEntity[]>;
}

const fetchResource = async (id:string, session: Session) : Promise<Resource> => {

    const response = await fetch(`http://localhost:8080/api/v1/o/${session.user.organization_id}/resources/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.id_token}`
      }
    });
  
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  
    const data = await response.json();
    return data;
  };

function ActionSelector({ resourceId, selectedResourceActions } : ActionSelectorProps) {

    const { data: session } = useSession()
    const { toast } = useToast()
    const [resource, setResorce] = useState<Resource>()
    const [selectedActions, setSelectedActions] = useState<MultiSelectItem[]>(selectedResourceActions.get(resourceId)?.map(action => ({
        value: action.id,
        label: action.identifier
      })) ?? []);

    useEffect(() => {
        const actions = selectedActions
        .map(action => resource?.actions?.find(a => a.id === action.value))
        .filter(action => action !== undefined) as ActionEntity[];
        console.log(selectedActions)
        selectedResourceActions.set(resourceId, actions);
    }, [selectedActions, resourceId, resource?.actions]);

    const handleSelectActions = (items: MultiSelectItem[]) => {
        setSelectedActions(items);
    };
    useEffect(() => {
        const loadResource = async () => {
          try {
            const resource = await fetchResource(resourceId, session!)
            setResorce(resource);
          } catch (error) {
            console.error('Failed to fetch resource:', error);
          }
        };
    
        if (session) {
            loadResource();
        }
      }, [session])
  return (
    resource?.actions ? 
    <MultiSelect items={resource?.actions?.map((action: any) => ({
        value: action.id,
        label: action.identifier
      }))} onSelect={handleSelectActions} selectedItems={selectedActions} />
      : <div></div>
  )
}

export default ActionSelector