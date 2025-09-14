import React from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath, 
  getStraightPath,
  getSmoothStepPath
} from 'reactflow';
import { 
  Database, 
  Zap, 
  Globe, 
  Shield, 
  ArrowRight,
  Wifi
} from 'lucide-react';

/**
 * DataFlowEdge - Represents data persistence and storage connections
 */
export const DataFlowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  markerEnd
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#10b981', // Green for data flow
          strokeWidth: 3,
          strokeDasharray: '0'
        }}
      />
      
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-300 flex items-center space-x-1"
          >
            <Database size={12} />
            <span>{data.label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

/**
 * APICallEdge - Represents HTTP requests and API calls
 */
export const APICallEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  markerEnd
}) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#3b82f6', // Blue for API calls
          strokeWidth: 2,
          strokeDasharray: '5,5'
        }}
      />
      
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-300 flex items-center space-x-1"
          >
            <Zap size={12} />
            <span>{data.label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

/**
 * CDNDeliveryEdge - Represents content delivery network connections
 */
export const CDNDeliveryEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  markerEnd
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.8 // More curved for CDN
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#8b5cf6', // Purple for CDN
          strokeWidth: 3,
          strokeDasharray: '0'
        }}
      />
      
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-purple-100 text-purple-800 px-2 py-1 rounded-full border border-purple-300 flex items-center space-x-1"
          >
            <Globe size={12} />
            <span>{data.label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

/**
 * AuthFlowEdge - Represents authentication and security flows
 */
export const AuthFlowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  markerEnd
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#ef4444', // Red for auth flows
          strokeWidth: 2,
          strokeDasharray: '10,5'
        }}
      />
      
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-red-100 text-red-800 px-2 py-1 rounded-full border border-red-300 flex items-center space-x-1"
          >
            <Shield size={12} />
            <span>{data.label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

/**
 * NetworkFlowEdge - Represents general network connections
 */
export const NetworkFlowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  markerEnd
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#6b7280', // Gray for network
          strokeWidth: 2,
          strokeDasharray: '0'
        }}
      />
      
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-gray-100 text-gray-800 px-2 py-1 rounded-full border border-gray-300 flex items-center space-x-1"
          >
            <Wifi size={12} />
            <span>{data.label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

/**
 * UserInteractionEdge - Represents user interaction points
 */
export const UserInteractionEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  markerEnd
}) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#f59e0b', // Orange for user interactions
          strokeWidth: 3,
          strokeDasharray: '15,5'
        }}
      />
      
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-orange-100 text-orange-800 px-2 py-1 rounded-full border border-orange-300 flex items-center space-x-1"
          >
            <ArrowRight size={12} />
            <span>{data.label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Export all edge types
export const edgeTypes = {
  dataFlow: DataFlowEdge,
  apiCall: APICallEdge,
  cdnDelivery: CDNDeliveryEdge,
  authFlow: AuthFlowEdge,
  networkFlow: NetworkFlowEdge,
  userInteraction: UserInteractionEdge
};

export default {
  DataFlowEdge,
  APICallEdge,
  CDNDeliveryEdge,
  AuthFlowEdge,
  NetworkFlowEdge,
  UserInteractionEdge,
  edgeTypes
};