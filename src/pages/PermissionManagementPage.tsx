import React, { useState, useEffect, useCallback } from 'react';
import { FiShield, FiChevronDown, FiChevronRight, FiCheck, FiX } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { Button, LoadingSpinner, ConfirmDialog } from '../components/ui';
import * as permissionApi from '../services/permissionApi';
import * as roleApi from '../services/roleApi';
import { logError } from '../services/errorApi';

interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
  group: string;
}

interface PermissionGroup {
  group: string;
  permissions: Permission[];
}

interface Role {
  id: number;
  name: string;
}

const GROUP_COLORS: Record<string, string> = {
  accounting: '#2196F3',
  inventory: '#4CAF50',
  sales: '#FF9800',
  catalog: '#9C27B0',
  admin: '#F44336',
  default: '#607D8B',
};

const getGroupColor = (group: string): string => {
  const key = group.toLowerCase();
  for (const prefix of Object.keys(GROUP_COLORS)) {
    if (key.startsWith(prefix)) return GROUP_COLORS[prefix];
  }
  return GROUP_COLORS.default;
};

const PermissionManagementPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const data = await roleApi.getRoles();
        setRoles(data);
      } catch (err) {
        logError(err, '/permissions');
        setError('Error al cargar los roles.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const loadRolePermissions = useCallback(async (roleId: number) => {
    try {
      setLoadingPermissions(true);
      setError('');
      setSuccessMessage('');

      const [allPermissions, rolePermissions] = await Promise.all([
        permissionApi.getPermissions(),
        permissionApi.getRolePermissions(roleId),
      ]);

      if (allPermissions && typeof allPermissions === 'object' && !Array.isArray(allPermissions)) {
        setPermissionGroups(
          Object.entries(allPermissions).map(([group, permissions]) => ({
            group,
            permissions: permissions as Permission[],
          }))
        );
      } else if (Array.isArray(allPermissions) && allPermissions.length > 0) {
        if (allPermissions[0].group !== undefined && allPermissions[0].permissions !== undefined) {
          setPermissionGroups(allPermissions);
        } else {
          const grouped: Record<string, Permission[]> = {};
          allPermissions.forEach((p: Permission) => {
            const group = p.group || 'general';
            if (!grouped[group]) grouped[group] = [];
            grouped[group].push(p);
          });
          setPermissionGroups(
            Object.entries(grouped).map(([group, permissions]) => ({
              group,
              permissions,
            }))
          );
        }
      } else {
        setPermissionGroups([]);
      }

      const ids = new Set<number>(
        Array.isArray(rolePermissions)
          ? rolePermissions.map((rp: any) => (typeof rp === 'number' ? rp : rp.id || rp.permissionId))
          : []
      );
      setSelectedPermissionIds(ids);

      if (Array.isArray(allPermissions)) {
        const groups = allPermissions.map((g: any) => g.group || g.group);
        setExpandedGroups(new Set(groups.filter(Boolean)));
      }
    } catch (err) {
      logError(err, '/permissions');
      setError('Error al cargar los permisos del rol.');
    } finally {
      setLoadingPermissions(false);
    }
  }, []);

  const handleRoleSelect = (roleId: number) => {
    setSelectedRoleId(roleId);
    loadRolePermissions(roleId);
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const toggleGroupAll = (group: PermissionGroup) => {
    const groupIds = group.permissions.map((p) => p.id);
    const allSelected = groupIds.every((id) => selectedPermissionIds.has(id));

    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        groupIds.forEach((id) => next.delete(id));
      } else {
        groupIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      await permissionApi.setRolePermissions(
        selectedRoleId,
        Array.from(selectedPermissionIds)
      );
      setSuccessMessage('Permisos guardados exitosamente.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      logError(err, '/permissions');
      setError('Error al guardar los permisos.');
    } finally {
      setSaving(false);
      setShowSaveConfirm(false);
    }
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Permisos" icon={<FiShield />} />

      {error && (
        <div style={styles.errorBanner}>
          <FiX style={{ marginRight: '0.5rem' }} />
          {error}
        </div>
      )}
      {successMessage && (
        <div style={styles.successBanner}>
          <FiCheck style={{ marginRight: '0.5rem' }} />
          {successMessage}
        </div>
      )}

      <div style={styles.layout}>
        {/* Left panel: Role selector */}
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Roles</h3>
          </div>
          <div style={styles.roleList}>
            {loading ? (
              <LoadingSpinner size="sm" text="Cargando roles..." />
            ) : roles.length === 0 ? (
              <p style={styles.emptyText}>No hay roles disponibles.</p>
            ) : (
              roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  style={{
                    ...styles.roleItem,
                    ...(selectedRoleId === role.id ? styles.roleItemActive : {}),
                  }}
                >
                  <FiShield style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                  {role.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel: Permission grid */}
        <div style={styles.rightPanel}>
          {!selectedRoleId ? (
            <div style={styles.emptyState}>
              <FiShield style={{ fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '1rem' }} />
              <p style={styles.emptyStateText}>
                Selecciona un rol para gestionar sus permisos
              </p>
            </div>
          ) : loadingPermissions ? (
            <div style={styles.emptyState}>
              <LoadingSpinner text="Cargando permisos..." />
            </div>
          ) : (
            <>
              <div style={styles.panelHeader}>
                <h3 style={styles.panelTitle}>
                  Permisos para: <span style={{ color: 'var(--primary-color)' }}>{selectedRole?.name}</span>
                </h3>
              </div>

              <div style={styles.permissionGrid}>
                {permissionGroups.map((group) => {
                  const isExpanded = expandedGroups.has(group.group);
                  const groupIds = group.permissions.map((p) => p.id);
                  const allSelected = groupIds.every((id) => selectedPermissionIds.has(id));
                  const someSelected = groupIds.some((id) => selectedPermissionIds.has(id));
                  const color = getGroupColor(group.group);

                  return (
                    <div key={group.group} style={styles.groupCard}>
                      <div
                        style={{ ...styles.groupHeader, borderLeftColor: color }}
                        onClick={() => toggleGroup(group.group)}
                      >
                        <div style={styles.groupHeaderLeft}>
                          {isExpanded ? (
                            <FiChevronDown style={styles.chevron} />
                          ) : (
                            <FiChevronRight style={styles.chevron} />
                          )}
                          <span style={styles.groupName}>{group.group}</span>
                          <span style={styles.groupCount}>
                            ({groupIds.filter((id) => selectedPermissionIds.has(id)).length}/{groupIds.length})
                          </span>
                        </div>
                        <label
                          style={styles.groupCheckboxLabel}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = someSelected && !allSelected;
                            }}
                            onChange={() => toggleGroupAll(group)}
                            style={styles.checkbox}
                          />
                          <span style={styles.checkboxText}>Seleccionar todos</span>
                        </label>
                      </div>

                      {isExpanded && (
                        <div style={styles.groupBody}>
                          {group.permissions.map((permission) => (
                            <label
                              key={permission.id}
                              style={styles.permissionItem}
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissionIds.has(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                style={styles.checkbox}
                              />
                              <div style={styles.permissionInfo}>
                                <span style={styles.permissionName}>{permission.name}</span>
                                {permission.description && (
                                  <span style={styles.permissionDescription}>
                                    {permission.description}
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {permissionGroups.length > 0 && (
                <div style={styles.saveContainer}>
                  <Button
                    variant="primary"
                    onClick={() => setShowSaveConfirm(true)}
                    loading={saving}
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : 'Guardar Permisos'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onConfirm={handleSave}
        onCancel={() => setShowSaveConfirm(false)}
        title="Guardar permisos"
        message="¿Estás seguro de guardar los permisos para este rol?"
        confirmText="Guardar"
        cancelText="Cancelar"
        variant="warning"
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    gap: '1.5rem',
    minHeight: '600px',
    flexWrap: 'wrap' as const,
  },
  leftPanel: {
    flex: '0 0 260px',
    background: 'var(--surface-color)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
  },
  rightPanel: {
    flex: 1,
    minWidth: '300px',
    background: 'var(--surface-color)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  panelHeader: {
    padding: '1.2rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--background-color)',
  },
  panelTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  roleList: {
    padding: '0.5rem',
    maxHeight: '500px',
    overflowY: 'auto' as const,
  },
  roleItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textAlign: 'left' as const,
    transition: 'all 0.2s ease',
    marginBottom: '0.25rem',
  },
  roleItemActive: {
    background: 'var(--primary-color)',
    color: '#000',
    fontWeight: 600,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center' as const,
  },
  emptyStateText: {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
  },
  emptyText: {
    color: 'var(--text-secondary)',
    padding: '1rem',
    textAlign: 'center' as const,
    fontSize: '0.9rem',
  },
  permissionGrid: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  groupCard: {
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    background: 'var(--background-color)',
    cursor: 'pointer',
    borderLeft: '4px solid',
    transition: 'background 0.2s ease',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  groupHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  chevron: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    flexShrink: 0,
  },
  groupName: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    textTransform: 'capitalize' as const,
  },
  groupCount: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  groupCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  checkboxText: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
  },
  checkbox: {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
    accentColor: 'var(--primary-color)',
  },
  groupBody: {
    padding: '0.5rem 1rem 0.75rem 2rem',
  },
  permissionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    padding: '0.5rem 0',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border-color)',
  },
  permissionInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  permissionName: {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  permissionDescription: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '0.15rem',
  },
  saveContainer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    background: '#fdeded',
    color: '#5f2120',
    border: '1px solid #f5c6cb',
    fontSize: '0.9rem',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    background: '#edf7ed',
    color: '#1e4620',
    border: '1px solid #c3e6cb',
    fontSize: '0.9rem',
  },
};

export default PermissionManagementPage;
