import { useAtomValue } from 'jotai';
import { cartItemsAtom } from '@/store';
import { Navbar, Nav, Container } from 'react-bootstrap';

export default function TabNavigation() {
    const cartItems = useAtomValue(cartItemsAtom);
    
    return (
        <Navbar expand="lg">
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav justify variant='tabs' id='tab-nav' className='me-auto'>
                        <Nav.Item>
                            <Nav.Link href='/user-profile'>Profile</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='/recommendation'>Recommendations</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='/compatibility'>Compatibility</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='/shopping-cart'>Cart {cartItems?.length > 0 && `(${cartItems.length})`}</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href='/account-details'>Account</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
        </Navbar>
    );
}