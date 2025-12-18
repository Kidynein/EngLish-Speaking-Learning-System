import React, { useState, useEffect, useContext } from 'react';
import { Card, Table, Button, Form, Row, Col, Pagination, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const HistoryPage = () => {
    const { user } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const fetchHistory = async (page = 1) => {
        if (!user || !user.id) {
            console.log('User not available');
            return;
        }

        setLoading(true);
        try {
            console.log('Fetching history for user:', user.id, 'page:', page);
            const response = await api.get(`/users/${user.id}/history`, {
                params: { page, limit: 10, startDate, endDate, type: typeFilter }
            });
            console.log('History response:', response.data);
            setHistory(response.data.data.history || []);
            setTotalPages(Math.ceil((response.data.data.total || 0) / 10));
        } catch (error) {
            console.error('Failed to fetch history:', error);
            toast.error('Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(currentPage);
    }, [currentPage, user]);

    const handleFilter = () => {
        setCurrentPage(1);
        fetchHistory(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="container mt-4">
            <h2>My Learning History</h2>

            {/* Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Exercise Type</Form.Label>
                                <Form.Select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    <option value="pronunciation">Pronunciation</option>
                                    <option value="reading">Reading</option>
                                    <option value="speaking">Speaking</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3} className="d-flex align-items-end">
                            <Button
                                variant="primary"
                                onClick={handleFilter}
                            >
                                Filter
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* History Table */}
            <Card>
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-4">
                            <p>Loading history...</p>
                        </div>
                    ) : (
                        <>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Topic</th>
                                        <th>Lesson</th>
                                        <th>Exercise</th>
                                        <th>Type</th>
                                        <th>Score</th>
                                        <th>Session Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(item => (
                                        <tr key={item.id}>
                                            <td>{formatDate(item.date)}</td>
                                            <td>{item.topicName || 'N/A'}</td>
                                            <td>{item.lessonName || 'N/A'}</td>
                                            <td>{item.exerciseContent ? item.exerciseContent.substring(0, 50) + '...' : 'N/A'}</td>
                                            <td>
                                                <Badge bg="info">{item.exerciseType || 'N/A'}</Badge>
                                            </td>
                                            <td>
                                                <Badge bg={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'danger'}>
                                                    {item.score || 0}/100
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={item.sessionScore >= 80 ? 'success' : item.sessionScore >= 60 ? 'warning' : 'danger'}>
                                                    {item.sessionScore || 0}/100
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {history.length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-muted">No history found. Start practicing to see your progress!</p>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                    <Pagination>
                        {[...Array(totalPages)].map((_, i) => (
                            <Pagination.Item
                                key={i + 1}
                                active={i + 1 === currentPage}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;