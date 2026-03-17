import { useState, useEffect, useCallback } from 'react';
import { groupsService } from '../services/groups.service';
import { Group } from '../types';

export const useMyGroups = (userId: number, token: string) => {
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMyGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await groupsService.getMemberGroups(userId, token);
      setMyGroups(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar mis grupos';
      setError(errorMessage);
      console.error('Error al cargar mis grupos:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    loadMyGroups();
  }, [loadMyGroups]);

  return {
    myGroups,
    loading,
    error,
    reloadMyGroups: loadMyGroups,
  };
};

export const useCreatedGroups = (userId: number, token: string) => {
  const [createdGroups, setCreatedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCreatedGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await groupsService.getCreatedGroups(userId, token);
      setCreatedGroups(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar grupos creados';
      setError(errorMessage);
      console.error('Error al cargar grupos creados:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    loadCreatedGroups();
  }, [loadCreatedGroups]);

  return {
    createdGroups,
    loading,
    error,
    reloadCreatedGroups: loadCreatedGroups,
  };
};

export const useDiscoverGroups = (userId: number, token: string) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDiscoverGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await groupsService.discoverGroups(userId, token);
      setGroups(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al descubrir grupos';
      setError(errorMessage);
      console.error('Error al descubrir grupos:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    loadDiscoverGroups();
  }, [loadDiscoverGroups]);

  return {
    groups,
    loading,
    error,
    reloadDiscoverGroups: loadDiscoverGroups,
  };
};

export const useGroupDetail = (groupId: number, token: string) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroupDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await groupsService.getGroupDetail(groupId, token);
      setGroup(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar detalle del grupo';
      setError(errorMessage);
      console.error('Error al cargar detalle del grupo:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId, token]);

  useEffect(() => {
    loadGroupDetail();
  }, [loadGroupDetail]);

  return {
    group,
    loading,
    error,
    reloadGroupDetail: loadGroupDetail,
  };
};
