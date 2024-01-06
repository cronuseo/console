"use client"

import React, { useEffect, useState } from 'react'
import { MultiSelect } from './ui/multi-select'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToast } from './ui/use-toast';
import { Resource } from '@/types';
import { Session } from 'next-auth';

interface ActionSelectorProps {
    resourceId:string
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

function ActionSelector({ resourceId} : ActionSelectorProps) {

    const { data: session } = useSession()
    const { toast } = useToast()
    const router = useRouter()
    const [resource, setResorce] = useState<Resource>()
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
    <MultiSelect items={resource?.actions?.map((role: any) => ({
        value: role.id,
        label: role.identifier
      }))} onSelect={()=>{}} selectedItems={[]} />
      : <div></div>
  )
}

export default ActionSelector